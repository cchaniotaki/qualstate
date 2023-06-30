const logger = require("../logger/logger.js");
const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });

const separator = "____SEPARATOR___";

const schema = {
	type: "object",
	properties: {
		qualstate: {
			type: "object",
			properties: {
				url:  {
					"type": "string"
				},
				process: {
					"type": "number"
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
									{ "required": ["input", "info"] },
									{ "required": ["action", "info"] },
									{ "required": ["input", "action", "info"] }
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
			"maxProperties": 5,
			additionalProperties: false,			
			"required": ["url"],
		}
	}
}

function validateSchema(data) { // npm install ajv-errors e logger nas opções do ajv
	const validate = ajv.compile(schema);
	const valid = validate(data);
	if (valid) {
		logger.logDetails("info", { msg: "Input válido" });
		return true
	} else {
		ajv.errorsText(validate.errors, {separator: separator}).split(separator).forEach(error => {
			logger.logDetails("error", { msg: error });
		});
		return false;
	}
}

module.exports = { validateSchema };