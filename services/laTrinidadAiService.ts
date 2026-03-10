const API_BASE = ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) || '';

export const askLaTrinidadGuide = async (
  userInput: string, 
  onChunk: (chunk: string) => void
): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/chatbot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: userInput }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error. status: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (error) {
    console.error('Error reading stream:', error);
    throw error;
  } finally {
    reader.releaseLock();
  }
};