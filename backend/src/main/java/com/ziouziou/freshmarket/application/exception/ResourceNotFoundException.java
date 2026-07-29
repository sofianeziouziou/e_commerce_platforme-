package com.ziouziou.freshmarket.application.exception;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resourceName, Object resourceId) {
        super("RESOURCE_NOT_FOUND", resourceName + " introuvable: " + resourceId);
    }
}

