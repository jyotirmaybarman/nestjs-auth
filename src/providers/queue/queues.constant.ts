const QUEUES = {
  AUTH_QUEUE: 'auth',
};

const EVENTS = {
  SEND_VERIFICATION_EMAIL: 'send_verification_email',
  RESEND_VERIFICATION_EMAIL: 'resend_verification_email',
  
};

Object.freeze(QUEUES);
Object.freeze(EVENTS);

export { EVENTS, QUEUES };
