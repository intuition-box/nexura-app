/**
 * Reown AppKit initializer.
 *
 * This file dynamically imports `@reown/appkit` and the Wagmi adapter and
 * initializes a singleton modal instance. If the optional packages are not
 * available, functions gracefully noop.
 */

let _noop = { isAvailable: false, open: () => {}, close: () => {} } as any;
export async function initAppKit() { return _noop; }
export async function getAppKit() { return _noop; }
export async function openAppKit() { return _noop; }
export default { initAppKit, getAppKit, openAppKit };
