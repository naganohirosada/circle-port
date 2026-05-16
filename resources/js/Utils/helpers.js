/**
 * 指定された通貨設定に基づいて金額をフォーマットする
 * @param {number} amount - 日本円ベースの金額
 * @param {object} currency - 通貨設定オブジェクト (code, rate)
 * @param {boolean} applySpread - 為替スプレッド(5%)を適用するかどうか
 * @returns {string} フォーマットされた文字列
 */
export const formatCurrency = (amount, currency, applySpread = false) => {
    if (!currency) return `¥${Math.round(amount).toLocaleString()}`;

    // JPY以外かつスプレッド適用フラグが真の場合、5%のスプレッドを加算
    const spread = (currency.code === 'JPY' || !applySpread) ? 1 : 1.05;
    const rate = currency.rate * spread;
    
    // 日本円の場合は小数点なし、それ以外は小数点第一位まで表示（Rp等の精度確保のため）
    const fractionDigits = currency.code === 'JPY' ? 0 : 1;

    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(amount * rate);
};

/**
 * 日本円をメイン表示し、外貨を（）内に表示する二重通貨表示
 * @param {number} amount - 日本円ベースの金額
 * @param {object} currency - ユーザーの設定通貨オブジェクト
 * @returns {string} "¥1,000 ($7.4)" のような形式の文字列
 */
export const renderDualCurrency = (amount, currency) => {
    if (!amount) return '¥0';
    const jpy = `¥${Math.round(amount).toLocaleString()}`;
    
    // 設定通貨が日本円なら（）表示は不要
    if (!currency || currency.code === 'JPY') {
        return jpy;
    }
    
    // 外貨表示（スプレッド5%適用・小数点1位）を生成して結合
    const local = formatCurrency(amount, currency, true);
    return `${jpy} (${local})`;
};

/**
 * 翻訳キーから翻訳を取得する（フォールバック付き）
 */
export const __ = (key, language) => {
    return (language && language[key]) ? language[key] : key;
};