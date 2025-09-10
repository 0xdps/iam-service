package redis

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	rdb *redis.Client
	ctx context.Context
}

func NewClient(redisURL string) *Client {
	rdb := redis.NewClient(&redis.Options{
		Addr: redisURL,
	})

	return &Client{
		rdb: rdb,
		ctx: context.Background(),
	}
}

func (c *Client) Close() error {
	return c.rdb.Close()
}

func (c *Client) SetRevocation(key string, ttl time.Duration) error {
	return c.rdb.Set(c.ctx, key, "revoked", ttl).Err()
}

func (c *Client) IsRevoked(key string) (bool, error) {
	result, err := c.rdb.Get(c.ctx, key).Result()
	if err == redis.Nil {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return result == "revoked", nil
}

func (c *Client) PublishEvent(stream, event string, data map[string]interface{}) error {
	args := &redis.XAddArgs{
		Stream: stream,
		Values: map[string]interface{}{
			"event": event,
			"data":  data,
		},
	}
	return c.rdb.XAdd(c.ctx, args).Err()
}

func (c *Client) ReadEvents(stream, consumer, group string) ([]redis.XMessage, error) {
	streams, err := c.rdb.XReadGroup(c.ctx, &redis.XReadGroupArgs{
		Group:    group,
		Consumer: consumer,
		Streams:  []string{stream, ">"},
		Count:    10,
		Block:    time.Second,
	}).Result()

	if err != nil {
		return nil, err
	}

	if len(streams) == 0 {
		return []redis.XMessage{}, nil
	}

	return streams[0].Messages, nil
}

func (c *Client) AckEvent(stream, group, id string) error {
	return c.rdb.XAck(c.ctx, stream, group, id).Err()
}

func (c *Client) CreateConsumerGroup(stream, group string) error {
	return c.rdb.XGroupCreate(c.ctx, stream, group, "0").Err()
}