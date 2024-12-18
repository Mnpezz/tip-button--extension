window.NanoPay = {
  open: function(config) {
    // Open in a new window/tab since we can't inject the script
    const params = new URLSearchParams({
      title: config.title || 'Tip with Nano',
      amount: config.amount || '0.133',
      address: config.address,
      button: config.button || 'Open Natrium',
      position: config.position || 'bottom'
    });
    
    window.open(`https://pay.nano.to/pay?${params.toString()}`, '_blank');
  }
}; 