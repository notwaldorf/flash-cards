"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAnalysisDocument(analysis, url) {
    const result = analysis.getDocument(url);
    if (result.successful) {
        return result.value;
    }
    if (result.error) {
        const message = `Unable to get document ${url}: ${result.error.message}`;
        throw new Error(message);
    }
    throw new Error(`Unable to get document ${url}`);
}
exports.getAnalysisDocument = getAnalysisDocument;
//# sourceMappingURL=analyzer-utils.js.map