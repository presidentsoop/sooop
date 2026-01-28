"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

// =====================================================
// PROFESSIONAL MODAL COMPONENT
// Big Tech Style - Clean, Minimal, Functional
// =====================================================

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    footer?: ReactNode;
    showClose?: boolean;
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
};

export default function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = 'md',
    footer,
    showClose = true,
}: ModalProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative bg-white rounded-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in flex flex-col`}
            >
                {/* Header */}
                {(title || showClose) && (
                    <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div>
                            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
                            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                        </div>
                        {showClose && (
                            <button
                                onClick={onClose}
                                className="p-1.5 -m-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// =====================================================
// BUTTON VARIANTS
// =====================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            )}
            {!loading && icon}
            {children}
        </button>
    );
}

// =====================================================
// STATUS BADGE
// =====================================================

interface BadgeProps {
    status: 'active' | 'pending' | 'blocked' | 'rejected' | 'expired' | 'revoked' | 'approved' | string;
    size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: BadgeProps) {
    const statusConfig: Record<string, { bg: string; text: string; dot?: string }> = {
        active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
        approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
        pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
        blocked: { bg: 'bg-red-50', text: 'text-red-700' },
        rejected: { bg: 'bg-red-50', text: 'text-red-700' },
        expired: { bg: 'bg-gray-100', text: 'text-gray-600' },
        revoked: { bg: 'bg-gray-100', text: 'text-gray-600' },
    };

    const config = statusConfig[status.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-600' };

    return (
        <span className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'} font-medium rounded-full capitalize`}>
            {config.dot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
            {status}
        </span>
    );
}

// =====================================================
// AVATAR
// =====================================================

interface AvatarProps {
    src?: string | null;
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg',
        xl: 'w-24 h-24 text-2xl',
    };

    const initial = name?.charAt(0)?.toUpperCase() || '?';
    const computedClass = `${sizeClasses[size]} rounded-full object-cover ring-2 ring-white ${className}`;

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={computedClass}
            />
        );
    }

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ring-2 ring-white ${className}`}>
            {initial}
        </div>
    );
}

// =====================================================
// INFO ROW (for detail views)
// =====================================================

interface InfoRowProps {
    label: string;
    value?: string | ReactNode;
    mono?: boolean;
}

export function InfoRow({ label, value, mono }: InfoRowProps) {
    return (
        <div className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm font-medium text-gray-900 text-right ${mono ? 'font-mono' : ''}`}>
                {value || '-'}
            </span>
        </div>
    );
}
