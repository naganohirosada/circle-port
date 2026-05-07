export const formatCurrency = (jpyPrice, currency) => {
    const rate = currency?.rate || 1;
    const symbol = currency?.symbol || '¥';
    
    // 円価格にレートを掛け、小数点以下を切り捨て
    const converted = Math.floor(jpyPrice * rate);

    // 小数点以下を表示しない設定（maximumFractionDigits: 0）
    return `${symbol}${Number(converted).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}`;
};