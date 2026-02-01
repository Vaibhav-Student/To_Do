/**
 * Toast notification component
 * Displays temporary notifications with different types (success, error, info)
 */
function Toast({ toast }) {
    if (!toast.show) return null;

    return (
        <div className={`toast-notification ${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
        </div>
    );
}

export default Toast;
