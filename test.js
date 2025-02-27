function areURLsEquivalent(url1, url2) {
    try {
        // Normalize URLs by ensuring they have a protocol
        const parsedUrl1 = new URL(url1.startsWith('http') ? url1 : `https://${url1}`);
        const parsedUrl2 = new URL(url2.startsWith('http') ? url2 : `https://${url2}`);

        // Compare hostname, pathname

        return (
            parsedUrl1.hostname === parsedUrl2.hostname &&
            parsedUrl1.pathname === parsedUrl2.pathname
        );
    } catch (error) {
        console.error("Invalid URL(s)", error);
        return false;
    }
}

// Example usage
console.log(areURLsEquivalent("https://www.wikipedia.org/", "http://www.wikipedia.org/")); // true
console.log(areURLsEquivalent("https://www.wikipedia.org/", "https://en.wikipedia.org/")); // false
console.log(areURLsEquivalent("https://en.wikipedia.org/wiki/Main_Page", "http://en.wikipedia.org/wiki/Main_Page")); // false
console.log(areURLsEquivalent("https://en.wikipedia.org/wiki/Main_Page#section", "http://en.wikipedia.org/wiki/Main_Page")); // true
console.log(areURLsEquivalent("https://en.wikipedia.org/wiki/Main_Page?query=test", "http://en.wikipedia.org/wiki/Main_Page")); // false
console.log(areURLsEquivalent("https://en.wikipedia.org/wiki/Main_Page?query=test", "http://en.wikipedia.org/wiki/Main_Page?query=test")); // true
console.log(areURLsEquivalent("https://en.wikipedia.org/wiki/Main_Page?query=test#section", "http://en.wikipedia.org/wiki/Main_Page?query=test")); // true
console.log(areURLsEquivalent("https://en.wikipedia.org/wiki/Main_Page?query=123", "https://en.wikipedia.org/wiki/Main_Page?query=456")); // false
