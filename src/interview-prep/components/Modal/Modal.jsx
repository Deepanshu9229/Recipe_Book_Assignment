import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

/**
 * INTERVIEW QUESTION: "Create a reusable modal component"
 * 
 * Key concepts covered:
 * - React Portal for rendering outside component tree
 * - Focus management and accessibility
 * - Event handling and keyboard navigation
 * - Modal state management
 * - Overlay and backdrop handling
 * - Animation and transitions
 */

const Modal = ({
  isOpen = false,
  onClose = () => {},
  title = "",
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = ""
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const [mounted, setMounted] = useState(false);

  // Handle mounting for SSR compatibility
  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }

      // Trap focus within modal
      if (event.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  const handleBackdropClick = useCallback((event) => {
    if (event.target === event.currentTarget && closeOnBackdrop) {
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full m-4'
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? 'animate-fadeIn' : 'animate-fadeOut'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative bg-white rounded-lg shadow-xl transform transition-all ${
          sizeClasses[size]
        } ${className} ${
          isOpen ? 'animate-scaleIn' : 'animate-scaleOut'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Confirmation Modal
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // 'danger', 'warning', 'info'
  isLoading = false
}) => {
  const icons = {
    danger: <AlertTriangle className="text-red-600" size={24} />,
    warning: <AlertCircle className="text-yellow-600" size={24} />,
    info: <Info className="text-blue-600" size={24} />
  };

  const confirmButtonClasses = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-gray-700">{message}</p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${confirmButtonClasses[type]}`}
        >
          {isLoading ? 'Loading...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

// Alert Modal
export const AlertModal = ({
  isOpen,
  onClose,
  title = "Alert",
  message = "",
  type = "info", // 'success', 'error', 'warning', 'info'
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, isOpen, onClose]);

  const configs = {
    success: {
      icon: <CheckCircle className="text-green-600" size={24} />,
      titleColor: 'text-green-800',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    error: {
      icon: <AlertCircle className="text-red-600" size={24} />,
      titleColor: 'text-red-800',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    warning: {
      icon: <AlertTriangle className="text-yellow-600" size={24} />,
      titleColor: 'text-yellow-800',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    info: {
      icon: <Info className="text-blue-600" size={24} />,
      titleColor: 'text-blue-800',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  };

  const config = configs[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className={`rounded-lg p-4 ${config.bgColor} ${config.borderColor} border`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-medium ${config.titleColor}`}>
              {title}
            </h3>
            <p className="text-gray-700 mt-1">
              {message}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          OK
        </button>
      </div>
    </Modal>
  );
};

// Form Modal
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Form",
  children,
  submitText = "Submit",
  isLoading = false,
  submitDisabled = false
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {children}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || submitDisabled}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : submitText}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Hook for modal state management
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen
  };
};

// Modal Provider for managing multiple modals
export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState([]);

  const openModal = useCallback((modalComponent, props = {}) => {
    const id = Date.now().toString();
    setModals(prev => [...prev, { id, component: modalComponent, props }]);
    return id;
  }, []);

  const closeModal = useCallback((id) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  return (
    <div>
      {children}
      {modals.map(({ id, component: ModalComponent, props }) => (
        <ModalComponent
          key={id}
          {...props}
          isOpen={true}
          onClose={() => closeModal(id)}
        />
      ))}
    </div>
  );
};

// Drawer component (side modal)
export const Drawer = ({
  isOpen,
  onClose,
  position = 'right', // 'left', 'right', 'top', 'bottom'
  size = 'md',
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  className = ""
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: position === 'left' || position === 'right' ? 'w-80' : 'h-80',
    md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
    lg: position === 'left' || position === 'right' ? 'w-1/2' : 'h-1/2',
    xl: position === 'left' || position === 'right' ? 'w-2/3' : 'h-2/3'
  };

  const positionClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full'
  };

  const transformClasses = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    top: isOpen ? 'translate-y-0' : '-translate-y-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full'
  };

  if (!mounted) return null;

  const drawerContent = (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      {/* Drawer */}
      <div
        className={`absolute bg-white shadow-xl transform transition-transform duration-300 ${
          positionClasses[position]
        } ${sizeClasses[size]} ${transformClasses[position]} ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

// Custom CSS for animations (add to your CSS file)
const modalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.95) translate(-50%, -50%);
    }
    to { 
      opacity: 1;
      transform: scale(1) translate(-50%, -50%);
    }
  }
  
  @keyframes scaleOut {
    from { 
      opacity: 1;
      transform: scale(1) translate(-50%, -50%);
    }
    to { 
      opacity: 0;
      transform: scale(0.95) translate(-50%, -50%);
    }
  }
  
  .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
  .animate-fadeOut { animation: fadeOut 0.2s ease-out; }
  .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
  .animate-scaleOut { animation: scaleOut 0.2s ease-out; }
`;

export { modalStyles };
export default Modal;