document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('rankingContainer');
    const catButtons = document.querySelectorAll('.cat-btn');
    const dateBadge = document.getElementById('currentDateBadge');
    let allPlans = [];

    // 0. 動的日付の更新 (2026年3月最新版 など)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    if (dateBadge) {
        dateBadge.innerText = `${year}年${month}月最新版`;
    }

    // 1. データの読み込み
    try {
        // デモ用にわざと少し遅延させる（スケルトンを見せるため）
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = await fetch('plans.json');
        allPlans = await response.json();
        renderRanking('all'); 
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        container.innerHTML = '<div class="error">データの読み込みに失敗しました。</div>';
    }

    // 2. レンダリング関数
    function renderRanking(category) {
        container.innerHTML = '';
        
        let filtered = allPlans;
        if (category !== 'all') {
            filtered = allPlans.filter(p => p.category === category);
        }

        // 推奨度（isRecommended）でソート
        filtered.sort((a, b) => (b.isRecommended === a.isRecommended) ? 0 : b.isRecommended ? 1 : -1);

        filtered.forEach((plan, index) => {
            const card = document.createElement('div');
            card.className = 'review-card';
            
            const stars = '★'.repeat(plan.speedScore) + '☆'.repeat(5 - plan.speedScore);
            
            // 内容に応じてアイコンを付与
            const prosList = plan.pros.map(p => {
                let icon = '🧡';
                if (p.includes('速度') || p.includes('安定')) icon = '⚡';
                if (p.includes('円') || p.includes('安')) icon = '💰';
                if (p.includes('ポイント')) icon = '🛍️';
                if (p.includes('海外')) icon = '✈️';
                if (p.includes('家族')) icon = '👨‍👩‍👧‍👦';
                return `<li>${icon} ${p}</li>`;
            }).join('');
            
            const consList = plan.cons.map(c => `<li>💡 ${c}</li>`).join('');

            card.innerHTML = `
                ${plan.isRecommended ? `<div class="recommended-ribbon">⭐ 編集部イチオシ</div>` : ''}
                <div class="card-header">
                    <div class="rank-badge">${index + 1}位</div>
                    <div class="header-text">
                        <h2 style="font-size: 1.4rem;">${plan.name}</h2>
                        <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">${plan.carrier}</span>
                    </div>
                </div>

                <div class="card-content">
                    <div class="spec-col">
                        <!-- Killer Phrase (Phase 2) -->
                        ${plan.killerPhrase ? `<span class="killer-phrase">${plan.killerPhrase}</span>` : ''}
                        
                        <div class="price-box">
                            <span style="font-size: 0.8rem; color: var(--text-muted);">月額料金目安</span><br>
                            <span class="price-main">¥${plan.price.toLocaleString()}</span>
                            <span style="font-size: 0.9rem;">(税込)〜</span>
                        </div>
                        <div class="stars-area" style="margin-bottom: 15px;">
                            <span style="font-size: 0.8rem; color: var(--text-muted);">回線速度・安定性</span><br>
                            <div class="star-rating">${stars}</div>
                        </div>
                        <div style="font-size: 0.9rem; color: var(--text-main);">
                            <strong>容量:</strong> ${plan.capacity}<br>
                            <strong>通話:</strong> ${plan.callOptions}
                        </div>
                    </div>

                    <div class="analysis-col">
                        <h4>専門家による分析</h4>
                        <ul class="list-pros">
                            ${prosList}
                        </ul>
                        <ul class="list-cons">
                            ${consList}
                        </ul>
                        <div class="target-box">
                            <strong>こんな人におすすめ：</strong><br>
                            ${plan.target}
                        </div>
                    </div>
                </div>

                <div class="cta-area" style="padding: 0 40px 40px;">
                    <a href="${plan.url}" class="btn-cta-positive" target="_blank">
                        <span style="font-size: 0.8rem; opacity: 0.9; display: block; margin-bottom: 2px;">期間限定キャンペーン実施中</span>
                        ${plan.carrier} 公式サイトで詳細を見る
                    </a>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // 3. カテゴリーナビゲーションの動作
    catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            catButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderRanking(btn.dataset.cat);
        });
    });
});
