const textRecognition = {
  async recognize(_uri: string) {
    return {
      blocks: [
        {
          lines: [
            { text: "Jane Doe" },
            { text: "CEO, Acme Corp" },
            { text: "jane@acme.com" },
            { text: "+1 555 0100" },
          ],
        },
      ],
    };
  },
};

export default textRecognition;
