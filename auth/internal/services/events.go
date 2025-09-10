package services

import (
	"auth-service/internal/database"
	"auth-service/internal/redis"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

type EventService struct {
	redis *redis.Client
	db    *database.Repository
}

type EventData struct {
	UserID    string `json:"user_id,omitempty"`
	SessionID string `json:"session_id,omitempty"`
	Action    string `json:"action,omitempty"`
}

func NewEventService(redis *redis.Client) *EventService {
	return &EventService{
		redis: redis,
	}
}

func (s *EventService) StartConsumer() {
	streamName := "stream:iam.events"
	groupName := "auth-consumers"
	consumerName := "auth-service"

	// Create consumer group if it doesn't exist
	s.redis.CreateConsumerGroup(streamName, groupName)

	log.Println("Starting event consumer...")

	for {
		messages, err := s.redis.ReadEvents(streamName, consumerName, groupName)
		if err != nil {
			log.Printf("Error reading events: %v", err)
			time.Sleep(5 * time.Second)
			continue
		}

		for _, msg := range messages {
			if err := s.processEvent(msg.Values); err != nil {
				log.Printf("Error processing event: %v", err)
			} else {
				s.redis.AckEvent(streamName, groupName, msg.ID)
			}
		}

		time.Sleep(time.Second)
	}
}

func (s *EventService) processEvent(values map[string]interface{}) error {
	eventType, ok := values["event"].(string)
	if !ok {
		return fmt.Errorf("invalid event type")
	}

	dataStr, ok := values["data"].(string)
	if !ok {
		return fmt.Errorf("invalid event data")
	}

	var eventData EventData
	if err := json.Unmarshal([]byte(dataStr), &eventData); err != nil {
		return fmt.Errorf("failed to unmarshal event data: %v", err)
	}

	switch eventType {
	case "user.blocked":
		return s.handleUserBlocked(eventData)
	case "session.revoked":
		return s.handleSessionRevoked(eventData)
	default:
		log.Printf("Unknown event type: %s", eventType)
	}

	return nil
}

func (s *EventService) handleUserBlocked(data EventData) error {
	log.Printf("Handling user blocked event for user: %s", data.UserID)
	
	// Set user revocation in Redis
	if err := s.redis.SetRevocation(fmt.Sprintf("revoked:user:%s", data.UserID), 24*time.Hour); err != nil {
		return fmt.Errorf("failed to set user revocation: %v", err)
	}

	// Revoke all user sessions in database
	if s.db != nil {
		if err := s.db.RevokeUserSessions(data.UserID); err != nil {
			log.Printf("Failed to revoke user sessions in DB: %v", err)
		}
	}

	return nil
}

func (s *EventService) handleSessionRevoked(data EventData) error {
	log.Printf("Handling session revoked event for session: %s", data.SessionID)
	
	// Set session revocation in Redis
	if err := s.redis.SetRevocation(fmt.Sprintf("revoked:session:%s", data.SessionID), 24*time.Hour); err != nil {
		return fmt.Errorf("failed to set session revocation: %v", err)
	}

	// Revoke session in database
	if s.db != nil {
		if err := s.db.RevokeSession(data.SessionID); err != nil {
			log.Printf("Failed to revoke session in DB: %v", err)
		}
	}

	return nil
}