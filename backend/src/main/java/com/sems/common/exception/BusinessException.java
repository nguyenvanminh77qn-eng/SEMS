package com.sems.common.exception;

import org.springframework.http.HttpStatus;

/** Lỗi nghiệp vụ có mã HTTP rõ ràng. Các exception khác của nhóm nên kế thừa lớp này. */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;
    private final transient Object result;

    public BusinessException(HttpStatus status, String message) {
        this(status, message, null);
    }

    public BusinessException(HttpStatus status, String message, Object result) {
        super(message);
        this.status = status;
        this.result = result;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public Object getResult() {
        return result;
    }
}
