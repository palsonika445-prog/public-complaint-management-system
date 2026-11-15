import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import { NotificationProvider } from '../context/NotificationContext'
import LoginPage from '../pages/public/LoginPage'
import LandingPage from '../pages/public/LandingPage'
import '../i18n/i18n'

describe('PCMS Frontend Core Verification', () => {
  it('renders login page with email, password inputs, and quick demo credentials', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <NotificationProvider>
            <LoginPage />
          </NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Quick Demo Credentials/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
  })

  it('renders landing page with civic hero title and action links', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <NotificationProvider>
            <LandingPage />
          </NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Civic Technology for Indian Municipalities/i)).toBeInTheDocument()
    expect(screen.getByText(/File a Complaint/i)).toBeInTheDocument()
    expect(screen.getByText(/Report Anonymously/i)).toBeInTheDocument()
  })
})
