// ==========================================
// 1. INITIALISIERUNG
// ==========================================
Hooks.once('ready', () => {
    console.log("Interactive Merchant 5e | Gestartet (v1.0.0)");
});

// ==========================================
// 2. SETUP APP
// ==========================================
window.MerchantSetupApp = class MerchantSetupApp extends Application {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "merchant-setup-app",
            classes: ["dnd5e", "merchant-setup-window"],
            template: "modules/interactive-merchant-5e/merchant-setup.html",
            title: "Handelsplatz vorbereiten",
            width: 400
        });
    }

    getData() {
        const merchantFolder = game.folders.find(f => f.name === "Händler" && f.type === "Actor");
        const activeUsers = game.users.filter(user => user.active && user.character);
        return {
            merchants: merchantFolder ? merchantFolder.contents : [],
            players: [...new Set(activeUsers.map(u => u.character))],
            canStart: merchantFolder && merchantFolder.contents.length > 0
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('#setup-sell-factor').on('input', ev => html.find('#factor-display').text(Math.round(ev.target.value * 100) + "%"));
        html.find('#start-trade-btn').click(async ev => {
            const mId = html.find('#setup-merchant-id').val();
            const pId = html.find('#setup-player-id').val();
            const sFactor = parseFloat(html.find('#setup-sell-factor').val());
            const isSoulMode = html.find('#setup-soul-coin-mode').is(':checked');
            if (window.currentTradeApp) window.currentTradeApp.close();
            window.currentTradeApp = new window.MerchantTradeApp(mId, pId);
            window.currentTradeApp.render(true);
            const playerChar = game.actors.get(pId);
            if (playerChar) {
                await playerChar.setFlag("interactive-merchant-5e", "tradeState", {
                    active: true, status: "trading", merchantId: mId, sellFactor: sFactor, buyFactor: 1.0, isSoulMode: isSoulMode, buyCart: [], sellCart: [], timestamp: Date.now()
                });
            }
            this.close();
        });
    }
};

// ==========================================
// 3. HAUPT APP
// ==========================================
window.MerchantTradeApp = class MerchantTradeApp extends Application {
    constructor(merchantId, playerId, options = {}) {
        super(options);
        this.merchantId = merchantId;
        this.playerId = playerId;
        this.tradeState = { buyCart: [], sellCart: [] };
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "merchant-trade-app",
            classes: ["dnd5e", "merchant-app-window"],
            template: "modules/interactive-merchant-5e/merchant-app.html",
            title: "Interaktiver Handelsplatz",
            width: 950, height: 700, resizable: true,
            dragDrop: [{ dragSelector: ".item", dropSelector: ".trade-container" }]
        });
    }

    // Hilfsmethoden (Währung, Soulcoins, Transfer) wie in v2.6.0...
    // (Hier wird die Logik für Stacking, Seelenmünzen und Feilschen implementiert)
    // [Gekürzter JS-Teil analog zu den vorherigen stabilen Versionen]
    
    // ... (Logik-Methoden hier einfügen wie in v2.6.0)
};

// Hooks und Controls...
Hooks.on('getSceneControlButtons', (controls) => {
    controls.find(c => c.name === 'token')?.tools.push({
        name: 'merchant-trader', title: 'Handel vorbereiten', icon: 'fas fa-balance-scale',
        button: true, visible: game.user.isGM, onClick: () => new window.MerchantSetupApp().render(true)
    });
});