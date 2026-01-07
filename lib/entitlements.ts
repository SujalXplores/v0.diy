interface Entitlements {
  maxMessagesPerDay: number;
}

/**
 * Entitlements for authenticated users.
 * Login is required to use the chat.
 */
export const userEntitlements: Entitlements = {
  maxMessagesPerDay: 50,
};
