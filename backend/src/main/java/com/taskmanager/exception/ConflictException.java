package com.taskmanager.exception;

/**
 * Exception thrown when a conflict occurs (e.g., duplicate email)
 */
public class ConflictException extends RuntimeException {
    
    public ConflictException(String message) {
        super(message);
    }
    
    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
