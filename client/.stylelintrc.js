module.exports = {
  extends: ["stylelint-config-recommended"],
  rules: {
    // Allow Tailwind at-rules and @apply
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "tailwind",
          "apply",
          "variants",
          "responsive",
          "screen",
          "layer"
        ]
      }
    ],
    // allow empty blocks in some cases
    "block-no-empty": null
  }
};
