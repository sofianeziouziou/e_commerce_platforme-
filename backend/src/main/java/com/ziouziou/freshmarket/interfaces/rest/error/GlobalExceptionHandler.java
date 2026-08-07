package com.ziouziou.freshmarket.interfaces.rest.error;

import com.ziouziou.freshmarket.application.exception.BusinessException;
import com.ziouziou.freshmarket.application.exception.ConflictException;
import com.ziouziou.freshmarket.application.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFound(
            ResourceNotFoundException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.of(exception.getCode(), exception.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleEntityNotFound(
            jakarta.persistence.EntityNotFoundException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.of("RESOURCE_NOT_FOUND", exception.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(
            BusinessException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.of(exception.getCode(), exception.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleConflictException(
            ConflictException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiErrorResponse.of(exception.getCode(), exception.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        List<FieldErrorResponse> fieldErrors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toFieldErrorResponse)
                .toList();

        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.withFields(
                        "VALIDATION_ERROR",
                        "La requete contient des champs invalides.",
                        request.getRequestURI(),
                        fieldErrors
                ));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoResourceFound(
            NoResourceFoundException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.of("NOT_FOUND", "Ressource introuvable.", request.getRequestURI()));
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableMessage(
            org.springframework.http.converter.HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.of(
                        "MALFORMED_REQUEST",
                        "Requete invalide : valeur de champ incorrecte.",
                        request.getRequestURI()
                ));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.of(
                        "INVALID_PARAMETER",
                        "Parametre invalide : " + exception.getName(),
                        request.getRequestURI()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(
            Exception exception,
            HttpServletRequest request
    ) {
        log.error("Unexpected error on {} {}: ", request.getMethod(), request.getRequestURI(), exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiErrorResponse.of(
                        "INTERNAL_SERVER_ERROR",
                        "Une erreur interne est survenue.",
                        request.getRequestURI()
                ));
    }

    private FieldErrorResponse toFieldErrorResponse(FieldError fieldError) {
        return new FieldErrorResponse(fieldError.getField(), fieldError.getDefaultMessage());
    }
}

