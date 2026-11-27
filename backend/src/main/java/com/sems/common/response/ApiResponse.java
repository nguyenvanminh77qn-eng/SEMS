package com.sems.common.response;

/**
 * Cấu trúc response chung của toàn hệ thống (mục 5 trong tài liệu Backend):
 * code = mã HTTP, message = thông báo, result = dữ liệu hoặc thông tin lỗi.
 */
public record ApiResponse<T>(int code, String message, T result) {

    public static <T> ApiResponse<T> ok(T result) {
        return new ApiResponse<>(200, "Success", result);
    }

    public static <T> ApiResponse<T> ok(String message, T result) {
        return new ApiResponse<>(200, message, result);
    }

    public static <T> ApiResponse<T> created(String message, T result) {
        return new ApiResponse<>(201, message, result);
    }

    public static <T> ApiResponse<T> error(int code, String message, T result) {
        return new ApiResponse<>(code, message, result);
    }
}
