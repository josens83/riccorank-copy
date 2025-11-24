/**
 * Rich Editor Helper Utilities
 */

/**
 * Sanitize HTML content from editor
 */
export function sanitizeEditorContent(html: string): string {
  // Remove potentially dangerous tags and attributes
  const dangerousTags = ['script', 'iframe', 'object', 'embed'];
  let sanitized = html;

  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');

  return sanitized;
}

/**
 * Extract plain text from HTML
 */
export function extractTextFromHTML(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: simple regex
    return html.replace(/<[^>]*>/g, '').trim();
  }

  // Client-side: use DOM parser
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Count words in HTML content
 */
export function countWords(html: string): number {
  const text = extractTextFromHTML(html);
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Generate excerpt from HTML
 */
export function generateExcerpt(html: string, maxLength = 150): string {
  const text = extractTextFromHTML(html);
  
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Validate editor content
 */
export function validateEditorContent(
  html: string,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  } = {}
): { valid: boolean; error?: string } {
  const {
    minLength = 10,
    maxLength = 50000,
    required = true,
  } = options;

  const text = extractTextFromHTML(html);

  if (required && text.length === 0) {
    return { valid: false, error: '내용을 입력해주세요.' };
  }

  if (text.length < minLength) {
    return {
      valid: false,
      error: `최소 ${minLength}자 이상 입력해주세요. (현재: ${text.length}자)`,
    };
  }

  if (text.length > maxLength) {
    return {
      valid: false,
      error: `최대 ${maxLength}자까지 입력 가능합니다. (현재: ${text.length}자)`,
    };
  }

  return { valid: true };
}

/**
 * Check if content has images
 */
export function hasImages(html: string): boolean {
  return /<img[^>]+>/i.test(html);
}

/**
 * Extract all image URLs from content
 */
export function extractImageUrls(html: string): string[] {
  const imgRegex = /<img[^>]+src="([^">]+)"/gi;
  const urls: string[] = [];
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

/**
 * Format content for preview (limited HTML tags)
 */
export function formatForPreview(html: string): string {
  // Allow only safe tags
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote',
    'a', 'code', 'pre',
  ];

  const div = document.createElement('div');
  div.innerHTML = html;

  // Remove disallowed tags
  const allElements = div.getElementsByTagName('*');
  for (let i = allElements.length - 1; i >= 0; i--) {
    const element = allElements[i];
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      element.remove();
    }
  }

  return div.innerHTML;
}
