/**
 * Parses error response and returns appropriate error message.
 */
export async function parseErrorResponse(
  response: Response,
): Promise<{ message: string; code?: string }> {
  const defaultMessage =
    "Sorry, there was an error processing your message. Please try again.";
  const rateLimitMessage =
    "You have exceeded your maximum number of messages for the day. Please try again later.";

  try {
    const errorData = await response.json();
    const code = errorData.code as string | undefined;

    if (errorData.message) {
      return { message: errorData.message, code };
    }
    if (errorData.error) {
      return { message: errorData.error, code };
    }
    if (response.status === 429) {
      return { message: rateLimitMessage, code };
    }
  } catch {
    if (response.status === 429) {
      return { message: rateLimitMessage };
    }
  }
  return { message: defaultMessage };
}
