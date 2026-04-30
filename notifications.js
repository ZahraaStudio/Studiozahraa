/**
 * نظام الإشعارات المتقدم لمتجر استوديو الزهراء
 * يوفر إشعارات احترافية للعملاء بحالة طلباتهم
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.init();
    }

    init() {
        // إنشاء حاوية الإشعارات إذا لم تكن موجودة
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 2500;
                max-width: 400px;
            `;
            document.body.appendChild(container);
            this.container = container;
        } else {
            this.container = document.getElementById('notification-container');
        }
    }

    /**
     * عرض إشعار
     * @param {string} message - نص الإشعار
     * @param {string} type - نوع الإشعار (success, error, info, warning)
     * @param {number} duration - مدة عرض الإشعار بالميلي ثانية
     */
    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: { bg: '#10b981', border: '#059669' },
            error: { bg: '#ef4444', border: '#dc2626' },
            info: { bg: '#3b82f6', border: '#2563eb' },
            warning: { bg: '#f59e0b', border: '#d97706' }
        };

        const color = colors[type] || colors.info;
        
        notification.style.cssText = `
            background: ${color.bg};
            border: 1px solid ${color.border};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            margin-bottom: 12px;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 18px;">
                    ${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ⓘ'}
                </span>
                <p style="margin: 0; font-size: 14px;">${message}</p>
            </div>
        `;

        this.container.appendChild(notification);
        this.notifications.push(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
                this.notifications = this.notifications.filter(n => n !== notification);
            }, 300);
        }, duration);
    }

    success(message, duration = 4000) {
        this.show(message, 'success', duration);
    }

    error(message, duration = 4000) {
        this.show(message, 'error', duration);
    }

    info(message, duration = 4000) {
        this.show(message, 'info', duration);
    }

    warning(message, duration = 4000) {
        this.show(message, 'warning', duration);
    }

    /**
     * عرض إشعار بحالة الطلب
     */
    orderStatus(orderNumber, status) {
        const statusMessages = {
            'قيد التنفيذ': 'جاري تجهيز طلبك',
            'تم الشحن': 'تم شحن طلبك بنجاح',
            'تم التوصيل': 'تم توصيل طلبك',
            'مكتمل': 'شكراً لتعاملك معنا',
            'ملغي': 'تم إلغاء الطلب'
        };

        const message = `${statusMessages[status] || status} - الطلب: ${orderNumber}`;
        const type = status === 'ملغي' ? 'error' : status === 'مكتمل' ? 'success' : 'info';
        this.show(message, type, 5000);
    }

    /**
     * عرض إشعار بتطبيق كود الخصم
     */
    couponApplied(discount, type) {
        const message = `تم تطبيق خصم ${discount}${type === 'percentage' ? '%' : ' ج'}`;
        this.show(message, 'success', 3000);
    }

    /**
     * عرض إشعار بخطأ في الكود
     */
    couponError(reason) {
        const reasons = {
            'invalid': 'كود غير صالح',
            'expired': 'انتهت صلاحية الكود',
            'maxed': 'تم استنفاذ حد الاستخدام',
            'empty': 'يرجى إدخال كود الخصم'
        };
        this.show(reasons[reason] || 'خطأ في الكود', 'error', 3000);
    }
}

// إنشاء instance عام
const notificationSystem = new NotificationSystem();

// إضافة CSS للرسوم المتحركة
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .notification {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = notificationSystem;
}
