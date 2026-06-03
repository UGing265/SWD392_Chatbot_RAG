package chunker

// countTokens approximates token count.
// For English text, ~4 chars per token is a reasonable approximation.
func countTokens(text string) int {
	return len(text) / 4
}