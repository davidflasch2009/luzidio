// node:sqlite (nur in Tests genutzt) meldet beim Laden eine ExperimentalWarning.
// Für eine warnungsfreie Testausgabe wird sie im Hauptprozess und in allen Workern unterdrückt.
module.exports = async () => {
  const flag = '--disable-warning=ExperimentalWarning';
  if (!(process.env.NODE_OPTIONS ?? '').includes(flag)) {
    process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ''} ${flag}`.trim();
  }
  const original = process.emitWarning;
  process.emitWarning = () => undefined;
  try {
    require('node:sqlite');
  } finally {
    process.emitWarning = original;
  }
};
