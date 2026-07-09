package chunker

// countTokens approximates token count.
// For English text, ~4 chars per token is a reasonable approximation.
func countTokens(text string) int {
	if len(text) == 0 {
		return 0
	}
	tokens := len(text) / 4
	if tokens == 0 {
		return 1
	}
	return tokens
}
