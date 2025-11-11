import React from 'react';
import { CheckCircleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from './icons';

interface NotificationType {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface NotificationProps {
    notification: NotificationType;
    onDismiss: (id: number) => void;
}

const NotificationItem: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
    const icons = {
        success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
        error: <XCircleIcon className="w-6 h-6 text-red-500" />,
        info: <InformationCircleIcon className="w-6 h-6 text-blue-500" />,
    };

    const baseClasses = "flex items-start p-4 w-full max-w-sm bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transition-all duration-300 transform";

    return (
        <div className={`${baseClasses} animate-fade-in`}>
            <div className="flex-shrink-0">{icons[notification.type]}</div>
            <div className="mr-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.message}</p>
            </div>
            <div className="mr-4 flex-shrink-0 flex items-center">
                <button
                    onClick={() => onDismiss(notification.id)}
                    className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};


interface NotificationContainerProps {
    notifications: NotificationType[];
    onDismiss: (id: number) => void;
}

const Notification: React.FC<NotificationContainerProps> = ({ notifications, onDismiss }) => {
    return (
        <div aria-live="assertive" className="fixed inset-x-0 top-0 flex items-center flex-col-reverse px-4 py-6 pointer-events-none sm:p-6 z-50">
            <div className="w-full max-w-sm flex flex-col items-center space-y-4">
                {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} onDismiss={onDismiss} />
                ))}
            </div>
        </div>
    );
};


export default Notification;