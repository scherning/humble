#!/usr/bin/env node
// humble — shared configuration resolver
//
// Resolution order:
//   1. HUMBLE_MODE environment variable ("on" or "off")
//   2. Config file: ~/.config/humble/config.json → { "mode": "on"|"off" }
//   3. Default: "on"

const fs = require('fs');
const path = require('path');
const os = require('os');

const VALID_MODES = ['on', 'off'];

function getConfigDir() {
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'humble');
  }
  if (process.platform === 'win32') {
    return path.join(
      process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
      'humble'
    );
  }
  return path.join(os.homedir(), '.config', 'humble');
}

function getConfigPath() {
  return path.join(getConfigDir(), 'config.json');
}

function getMode() {
  // 1. Environment variable (highest priority)
  const envMode = process.env.HUMBLE_MODE;
  if (envMode && VALID_MODES.includes(envMode.toLowerCase())) {
    return envMode.toLowerCase();
  }

  // 2. Config file
  try {
    const configPath = getConfigPath();
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.mode && VALID_MODES.includes(config.mode.toLowerCase())) {
      return config.mode.toLowerCase();
    }
  } catch (e) {
    // Config file doesn't exist or is invalid — fall through
  }

  // 3. Default
  return 'on';
}

module.exports = { getMode, getConfigDir, getConfigPath, VALID_MODES };
