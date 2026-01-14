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
    <div className="overlay-wrapper" onClick={handleBackdropClick}>
      <div className="overlay">
        <button
          className="overlay-close"
          onClick={onClose}
          aria-label="Close dialog"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="row component column-splitter">
          <div className="col-12 col-lg-12 offset-lg-1">
            <div className="component container make-fullwidth-sm">
              <div className="component-content">
                <div className="component sitecore-form">
                  <div className="component-content">
                    <form
                      onSubmit={handleSubmit}
                      className="dynform-590d29184e414ca683445f18f149e995 initialized"
                      noValidate
                    >
                      <div className="form-group">
                        <h1 className="text-primary-1">Tell us about yourself</h1>
                      </div>

                      <div className="row">
                        <div className="form-group col-md-6">
                          <label htmlFor="firstName" className="">
                            First Name*
                          </label>
                          <input
                            id="firstName"
                            name="firstName"
                            className="form-control"
                            type="text"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            maxLength={255}
                            placeholder=""
                            data-sc-tracking="True"
                            data-sc-field-name="FirstName"
                            data-sc-field-key="96323AD10AE14AC6A64F71DF0A4EBC91"
                          />
                          {errors.firstName && (
                            <span className="field-validation-error">
                              {errors.firstName}
                            </span>
                          )}
                        </div>

                        <div className="form-group col-md-6">
                          <label htmlFor="lastName" className="">
                            Last Name*
                          </label>
                          <input
                            id="lastName"
                            name="lastName"
                            className="form-control"
                            type="text"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            maxLength={255}
                            placeholder=""
                            data-sc-tracking="True"
                            data-sc-field-name="Last Name"
                            data-sc-field-key="0E70BE0CBE8845D9B8A17446EC1190C0"
                          />
                          {errors.lastName && (
                            <span className="field-validation-error">
                              {errors.lastName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="row">
                        <div className="form-group col-md-6">
                          <label htmlFor="email" className="">
                            Email*
                          </label>
                          <input
                            id="email"
                            name="email"
                            className="form-control"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            maxLength={255}
                            placeholder="example@example.com"
                            data-sc-tracking="True"
                            data-sc-field-name="Email"
                            data-sc-field-key="266A1EB6154647BC9938758747E182C9"
                          />
                          {errors.email && (
                            <span className="field-validation-error">
                              {errors.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="row" style={{ marginTop: '20px' }}>
                        <div className="form-group col-md-12">
                          <button type="submit" className="btn btn-primary btn-sm">
                            Submit
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GatedResourceModal;
