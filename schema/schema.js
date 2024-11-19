const Ajv = require("ajv");
const ajv = new Ajv({allErrors: true});

const separator = "____SEPARATOR___";

const schema = {
    type: "object",
    properties: {
        url: {
            "type": "string"
        },
        executablePath: {
            "type": "string"
        },
        headless: {
            "type": "boolean"
        },
        waitTime: {
            "type": "number"
        },
        maxStates: {
            "type": "number"
        },
        numberOfProcess: {
            "type": "number"
        },
        browser: {
            "type": "string"
        },
        proxy: {
            type: "object",
            properties: {
                port: {
                    "type": "number"
                },
                host: {
                    "type": "string"
                }
            },
            "minProperties": 2,
            "maxProperties": 2,
            additionalProperties: false
        },
        cookies: {
            type: "object",
            properties: {
                waitBefore: {
                    "type": "number"
                },
                btn: {
                    "type": "string"
                },
                waitAfter: {
                    "type": "number"
                }
            },
            "minProperties": 1,
            "maxProperties": 3,
            additionalProperties: false
        },

        login: {
            "type": "array",
            "items": {
                "type": "object",
                properties: {
                    action: {
                        type: "object",
                        properties: {
                            id: {
                                "type": "string"
                            },
                            event: {
                                "type": "string"
                            }
                        },
                        "required": ["id", "event"],
                        additionalProperties: false
                    },
                    credentials: {
                        type: "object"
                    },
                    info: {
                        "type": "object",
                        properties: {
                            wait: {
                                "type": "number"
                            }
                        },
                        "required": ["wait"],
                        additionalProperties: false
                    }
                }
            },
            "minItems": 1
        },
        viewport: {
            type: "object",
            properties: {
                mobile: {
                    "type": "boolean"
                },
                landscape: {
                    "type": "boolean"
                },
                userAgent: {
                    "type": "string"
                },
                resolution: {
                    type: "object",
                    properties: {
                        width: {
                            "type": "number"
                        },
                        height: {
                            "type": "number"
                        }
                    },
                    "required": ["width", "height"],
                    additionalProperties: false
                }
            },
            "minProperties": 1,
            "maxProperties": 4,
            additionalProperties: false
        },
        log: {
            type: "object",
            properties: {
                file: {
                    "type": "boolean"
                },
                console: {
                    "type": "boolean"
                }
            },
            "minProperties": 1,
            "maxProperties": 2,
            additionalProperties: false
        },
        ignore: {
            type: "object",
            properties: {
                ids_compare: {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "minItems": 1
                },
                ids_events: {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "minItems": 1
                }
            },
            "minProperties": 1,
            "maxProperties": 2,
            additionalProperties: false
        },
        interaction: {
            type: "object",
            properties: {
                forms: {
                    "type": "array",
                    "items": {
                        "type": "object",
                        properties: {
                            input: {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "minProperties": 1
                                },
                                "minItems": 1
                            },
                            action: {
                                "type": "object",
                                properties: {
                                    id: {
                                        "type": "string"
                                    },
                                    event: {
                                        "type": "string"
                                    },
                                    additionalProperties: false
                                },
                                "required": ["id", "event"],

                            },
                            info: {
                                "type": "object",
                                properties: {
                                    formId: {
                                        "type": "string"
                                    },
                                    wait: {
                                        "type": "number"
                                    }
                                },
                                "required": ["formId"]
                            }
                        },
                        additionalProperties: false,
                        "anyOf": [
                            {"required": ["input", "info"]},
                            {"required": ["action", "info"]},
                            {"required": ["input", "action", "info"]}
                        ]
                    },
                    "minItems": 1
                },
                inputs: {
                    "type": "array",
                    "items": {
                        "type": "object",
                        properties: {
                            value: {
                                "type": "object",
                                "minProperties": 1
                            },
                            info: {
                                "type": "object",
                                properties: {
                                    wait: {
                                        "type": "number"
                                    }
                                },
                                "required": ["wait"],
                                additionalProperties: false,
                            }
                        },
                        additionalProperties: false,
                        "required": ["value"]
                    },
                    "minItems": 1
                },
                directions: {
                    "type": "array",
                    "items": {
                        "type": "object",
                        properties: {
                            actions: {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    properties: {
                                        values: {
                                            "type": "object",
                                            "minProperties": 1
                                        },
                                        action: {
                                            "type": "object",
                                            properties: {
                                                id: {
                                                    "type": "string"
                                                },
                                                eventType: {
                                                    "type": "string"
                                                },
                                                additionalProperties: false
                                            },
                                            "required": ["id", "eventType"]
                                        },
                                        info: {
                                            "type": "object",
                                            properties: {
                                                wait: {
                                                    "type": "number"
                                                }
                                            },
                                            "required": ["wait"],
                                            additionalProperties: false,
                                        }
                                    }
                                },
                                "minItems": 1
                            },
                            info: {
                                "type": "object",
                                properties: {
                                    crawl: {
                                        "type": "string",
                                        "enum": ["stop", "continue"]
                                    },
                                    save: {
                                        "type": "boolean"
                                    }
                                },
                                "required": ["crawl", "save"],
                                additionalProperties: false,
                            }
                        },
                        additionalProperties: false,
                        "required": ["info", "actions"]
                    },
                    "minItems": 1
                }
            },
            "minProperties": 1,
            "maxProperties": 3,
            additionalProperties: false
        }
    },
    "minProperties": 1,
    "maxProperties": 11,
    additionalProperties: false,
    "required": ["url"]
}

async function validateSchema(data, logger) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (valid) {
        logger.logDetails("info", {msg: "Valid input"});
        return data;
    } else {
        let errorMsg = "";
        await ajv.errorsText(validate.errors, {separator: separator}).split(separator).forEach(error => {
            errorMsg += "\n\t" + error;
        });
        throw new Error("Reading the options: " + errorMsg);
    }
}

module.exports = {validateSchema};