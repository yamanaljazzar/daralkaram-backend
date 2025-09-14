# Logger Configuration
# تكوين الـ Logger

## Overview | نظرة عامة

The logger configuration system provides a flexible way to configure logging behavior across different environments. It supports both file-based configuration and environment variable overrides.

نظام تكوين الـ logger يوفر طريقة مرنة لتكوين سلوك الـ logging عبر البيئات المختلفة. يدعم التكوين عبر الملفات و environment variables.

## Configuration Files | ملفات التكوين

### `logger.config.ts`

This file contains the main logger configuration with environment-specific settings.

هذا الملف يحتوي على التكوين الرئيسي للـ logger مع إعدادات خاصة بكل بيئة.

#### Base Configuration | التكوين الأساسي

```typescript
export const loggerConfig = {
  level: 'log',                    // Log level
  enableFileLogging: false,        // Enable file logging
  logDirectory: './logs',          // Log directory
  maxFileSize: 10485760,          // Max file size (10MB)
  maxFiles: 5,                     // Max number of files
  enableStructuredLogging: false,  // JSON format logging
  enablePerformanceLogging: true,  // Performance tracking
};
```

#### Environment-Specific Configuration | التكوين الخاص بكل بيئة

```typescript
export const loggerEnvironments = {
  development: {
    level: 'debug',
    enableFileLogging: true,
    enableStructuredLogging: false,
    enablePerformanceLogging: true,
  },
  
  production: {
    level: 'warn',
    enableFileLogging: true,
    enableStructuredLogging: true,
    enablePerformanceLogging: false,
  },
  
  test: {
    level: 'error',
    enableFileLogging: false,
    enableStructuredLogging: false,
    enablePerformanceLogging: false,
  },
  
  staging: {
    level: 'log',
    enableFileLogging: true,
    enableStructuredLogging: true,
    enablePerformanceLogging: true,
  },
};
```

## Environment Variables | متغيرات البيئة

You can override any configuration using environment variables:

يمكنك تجاوز أي تكوين باستخدام environment variables:

```bash
# Log Level
LOG_LEVEL=debug

# File Logging
LOG_FILE_ENABLED=true
LOG_DIRECTORY=./custom-logs

# File Management
LOG_MAX_FILE_SIZE=20971520  # 20MB
LOG_MAX_FILES=10

# Logging Features
LOG_STRUCTURED=true
LOG_PERFORMANCE=false
```

## Usage Examples | أمثلة الاستخدام

### 1. Basic Usage | الاستخدام الأساسي

```typescript
import { LoggerService } from '@/core/services';

@Injectable()
export class MyService {
  constructor(private readonly logger: LoggerService) {}
  
  doSomething() {
    this.logger.log('Operation started', 'MyService');
  }
}
```

### 2. Environment-Specific Behavior | السلوك الخاص بكل بيئة

The logger automatically adapts based on the current environment:

الـ logger يتكيف تلقائياً حسب البيئة الحالية:

- **Development**: Shows debug logs, enables performance tracking
- **Production**: Shows only warnings and errors, uses structured logging
- **Test**: Shows only errors, disables file logging
- **Staging**: Balanced configuration for testing

### 3. Custom Configuration | التكوين المخصص

```typescript
// In your service
constructor(private readonly logger: LoggerService) {
  // Change log level at runtime
  this.logger.setLogLevel(LogLevel.DEBUG);
  
  // Get current configuration
  const config = this.logger.getConfig();
  console.log('Current log level:', config.level);
}
```

## Configuration Priority | أولوية التكوين

The configuration is loaded in the following priority order:

يتم تحميل التكوين بالترتيب التالي:

1. **Environment Variables** (highest priority)
2. **Environment-specific config** (from `loggerEnvironments`)
3. **Base config** (from `loggerConfig`)

## Log Levels | مستويات الـ Log

- `ERROR` (0): Only error messages
- `WARN` (1): Warnings and errors
- `LOG` (2): Standard logs, warnings, and errors
- `DEBUG` (3): Debug information and above
- `VERBOSE` (4): All log messages

## File Logging | تسجيل الملفات

When file logging is enabled:

عند تفعيل تسجيل الملفات:

- Logs are saved to `./logs/` directory by default
- Files are named with date: `app-2024-01-15.log`
- Automatic log rotation based on file size
- Configurable maximum number of files

## Structured Logging | التسجيل المنظم

When structured logging is enabled, logs are output in JSON format:

عند تفعيل التسجيل المنظم، يتم إخراج الـ logs بصيغة JSON:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "LOG",
  "context": "MyService",
  "message": "Operation completed",
  "data": { "userId": "123" },
  "metadata": { "duration": 150 }
}
```

## Performance Logging | تسجيل الأداء

Performance logging tracks operation execution times:

تسجيل الأداء يتتبع أوقات تنفيذ العمليات:

```typescript
// Start timing
this.logger.startTimer('database-query');

// Perform operation
await this.database.query();

// End timing (automatically logs duration)
this.logger.endTimer('database-query', 'DatabaseService');
```

## Best Practices | أفضل الممارسات

1. **Use appropriate log levels** for different types of messages
2. **Include context** in your log messages
3. **Use structured logging** in production for better analysis
4. **Enable performance logging** during development
5. **Configure different settings** for different environments
6. **Use meaningful context names** for better log organization

## Troubleshooting | استكشاف الأخطاء

### Logs not appearing | الـ logs لا تظهر

1. Check the current log level
2. Verify environment variables
3. Ensure the logger is properly injected

### File logging not working | تسجيل الملفات لا يعمل

1. Check `LOG_FILE_ENABLED` environment variable
2. Verify directory permissions
3. Check available disk space

### Performance logging not showing | تسجيل الأداء لا يظهر

1. Ensure `LOG_PERFORMANCE=true`
2. Check that you're calling `startTimer` and `endTimer`
3. Verify the log level includes performance messages
