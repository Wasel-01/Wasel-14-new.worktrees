/**
 * Twilio Service for SMS and Voice Calls
 * 
 * Handles emergency SMS, voice calls, and notifications
 */

import { INTEGRATION_CONFIG } from './integrations';

const TWILIO_API_URL = 'https://api.twilio.com/2010-04-01';

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

// Get Twilio credentials from environment
function getTwilioConfig(): TwilioConfig | null {
  const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID || '';
  const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN || '';
  const phoneNumber = process.env.REACT_APP_TWILIO_PHONE_NUMBER || '';

  if (!accountSid || !authToken) {
    return null;
  }

  return { accountSid, authToken, phoneNumber };
}

// Create basic auth header for Twilio API
function createAuthHeader(config: TwilioConfig): string {
  const credentials = `${config.accountSid}:${config.authToken}`;
  return `Basic ${btoa(credentials)}`;
}

export const twilioService = {
  /**
   * Send SMS message
   */
  async sendSMS(
    to: string,
    message: string
  ): Promise<{ success: boolean; messageSid?: string; error?: string }> {
    const config = getTwilioConfig();
    
    if (!config || !INTEGRATION_CONFIG.twilio.enabled) {
      console.log(`[Mock SMS] To: ${to}, Message: ${message}`);
      return { success: true, messageSid: `SM_mock_${Date.now()}` };
    }

    try {
      // In production, this should call your backend API
      // Frontend should never expose auth token
      const response = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to send SMS' };
      }

      const data = await response.json();
      return { success: true, messageSid: data.messageSid };
    } catch (error: any) {
      console.error('SMS send failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send emergency SMS to contacts
   */
  async sendEmergencySMS(
    emergencyContacts: Array<{ name: string; phone: string }>,
    location: { lat: number; lng: number },
    tripId: string,
    userName: string
  ): Promise<{ sent: number; failed: number }> {
    const locationUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const message = `🚨 EMERGENCY ALERT from ${userName}\n\nTrip ID: ${tripId.slice(0, 8)}\nLocation: ${locationUrl}\n\nPlease check on them immediately or contact emergency services.`;

    let sent = 0;
    let failed = 0;

    for (const contact of emergencyContacts) {
      const result = await this.sendSMS(contact.phone, message);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { sent, failed };
  },

  /**
   * Initiate voice call
   */
  async initiateCall(
    from: string,
    to: string
  ): Promise<{ success: boolean; callSid?: string; error?: string }> {
    const config = getTwilioConfig();
    
    if (!config || !INTEGRATION_CONFIG.twilio.enabled) {
      console.log(`[Mock Call] From: ${from} to ${to}`);
      return { success: true, callSid: `CA_mock_${Date.now()}` };
    }

    try {
      // In production, this should call your backend API
      const response = await fetch('/api/twilio/initiate-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to initiate call' };
      }

      const data = await response.json();
      return { success: true, callSid: data.callSid };
    } catch (error: any) {
      console.error('Call initiation failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create conference call between driver and passenger
   */
  async createConferenceCall(
    driverPhone: string,
    passengerPhone: string,
    tripId: string
  ): Promise<{ success: boolean; conferenceSid?: string; error?: string }> {
    const config = getTwilioConfig();
    
    if (!config || !INTEGRATION_CONFIG.twilio.enabled) {
      console.log(`[Mock Conference] Driver: ${driverPhone}, Passenger: ${passengerPhone}`);
      return { success: true, conferenceSid: `CF_mock_${Date.now()}` };
    }

    try {
      // In production, this should call your backend API
      const response = await fetch('/api/twilio/create-conference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverPhone,
          passengerPhone,
          tripId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to create conference' };
      }

      const data = await response.json();
      return { success: true, conferenceSid: data.conferenceSid };
    } catch (error: any) {
      console.error('Conference call failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send verification code via SMS
   */
  async sendVerificationCode(
    phoneNumber: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Your Wassel verification code is: ${code}\n\nThis code will expire in 10 minutes.`;
    const result = await this.sendSMS(phoneNumber, message);
    return { success: result.success, error: result.error };
  },
};
