import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export const useError = () => {
  const [error, setError] = useState<AppError | null>(null);
  const [isError, setIsError] = useState(false);

  const handleError = useCallback((err: any, context?: string) => {
    console.error(`[${context || 'Unknown'}] Error:`, err);
    
    let appError: AppError;
    
    if (err?.code) {
      // Firebase or other structured errors
      appError = {
        code: err.code,
        message: err.message || 'An error occurred',
        details: err.details,
      };
    } else if (err instanceof Error) {
      appError = {
        code: 'UNKNOWN_ERROR',
        message: err.message,
        details: err.stack,
      };
    } else if (typeof err === 'string') {
      appError = {
        code: 'UNKNOWN_ERROR',
        message: err,
      };
    } else {
      appError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        details: err,
      };
    }
    
    setError(appError);
    setIsError(true);
    
    return appError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  const showErrorAlert = useCallback((error: AppError, title?: string) => {
    Alert.alert(
      title || '错误',
      error.message,
      [{ text: '确定', style: 'default' }]
    );
  }, []);

  const getErrorMessage = useCallback((error: AppError): string => {
    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': '用户不存在',
      'auth/wrong-password': '密码错误',
      'auth/invalid-email': '邮箱格式不正确',
      'auth/email-already-in-use': '邮箱已被注册',
      'auth/weak-password': '密码强度不足',
      'auth/requires-recent-login': '请重新登录',
      'auth/network-request-failed': '网络连接失败，请检查网络',
      'permission-denied': '权限不足',
      'not-found': '数据不存在',
      'unavailable': '服务暂时不可用',
      'deadline-exceeded': '请求超时',
      'unauthenticated': '请先登录',
    };

    return errorMessages[error.code] || error.message;
  }, []);

  return {
    error,
    isError,
    handleError,
    clearError,
    showErrorAlert,
    getErrorMessage,
  };
};
