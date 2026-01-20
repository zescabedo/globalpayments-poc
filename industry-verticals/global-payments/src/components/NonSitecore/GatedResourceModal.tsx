import React, { useState, FormEvent } from 'react';

interface GatedResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (token: string) => void;
}

function GatedResourceModal({ isOpen, onClose, onSuccess }: GatedResourceModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,17}$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name* is required.';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name* is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email* is required.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (newErrors.firstName || newErrors.lastName || newErrors.email) {
      setErrors(newErrors);
      return;
    }

    // Generate base64 token
    const tokenData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      timestamp: new Date().toISOString(),
    };
    const token = btoa(JSON.stringify(tokenData));

    // Store in localStorage
    localStorage.setItem('gatedResourceToken', token);

    // Call success callback
    if (onSuccess) {
      onSuccess(token);
    }

    // Reset form and close modal
    setFormData({ firstName: '', lastName: '', email: '' });
    setErrors({ firstName: '', lastName: '', email: '' });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not on the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="bx-modal_overlay" 
      aria-hidden="false" 
      style={{ display: 'flex' }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bx-modal_content" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="bx-modal_title" 
        aria-describedby="bx-modal_desc"
      >
        {/* Title */}
        <h3 id="bx-modal_title" className="bx-title">
          Tell us about yourself
        </h3>

        {/* Description */}
        <p id="bx-modal_desc" className="bx-description">
          Share a few details to start the download.
        </p>

        {/* Form */}
        <form id="bx-email_form" className="bx-form" onSubmit={handleSubmit} noValidate>
          {/* Row 1: First & Last name (inline on desktop, stacked on mobile) */}
          <div className="bx-row">
            <input
              id="bx-first_name"
              type="text"
              name="firstName"
              autoComplete="given-name"
              className="bx-input"
              placeholder="First name"
              aria-label="First name"
              aria-required="true"
              required
              value={formData.firstName}
              onChange={handleInputChange}
            />
            <input
              id="bx-last_name"
              type="text"
              name="lastName"
              autoComplete="family-name"
              className="bx-input"
              placeholder="Last name"
              aria-label="Last name"
              aria-required="true"
              required
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>

          {/* Row 2: Email */}
          <div className="bx-row">
            <input
              id="bx-email_input"
              type="email"
              name="email"
              autoComplete="email"
              className="bx-input"
              placeholder="Email address"
              aria-label="Email address"
              aria-required="true"
              required
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <button id="bx-submit_btn" type="submit" className="bx-modal_button">
            Get a quote today!
          </button>

          <div id="bx-error" className="bx-error" role="alert" aria-live="polite">
            {errors.firstName && <div>{errors.firstName}</div>}
            {errors.lastName && <div>{errors.lastName}</div>}
            {errors.email && <div>{errors.email}</div>}
          </div>

          <p className="bx-consent">
            By subscribing, you agree to our <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>. You can unsubscribe anytime.
          </p>
        </form>

        {/* Close (simple text "X" to avoid pseudo-element issues) */}
        <button 
          type="button" 
          className="bx-modal__btn-close-icon" 
          aria-label="Close"
          onClick={onClose}
        >
          X
        </button>
      </div>
    </div>
  );
}

export default GatedResourceModal;
