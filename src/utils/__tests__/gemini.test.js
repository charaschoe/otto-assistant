const { summarizeTranscript } = require("../gemini");

describe("Gemini Utils", () => {
	test("summarizeTranscript is a function", () => {
		expect(typeof summarizeTranscript).toBe("function");
	});

	// Add more tests as needed
});
