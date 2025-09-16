      const chatId = window.roomId
      const gifts = [
            { amount: 25, name: 'Cà Phê' },
            { amount: 50, name: 'Bữa Sáng' },
            { amount: 100, name: 'Bữa Trưa' },
            { amount: 200, name: 'Game Mới' },
            { amount: 500, name: 'Setup' },
            { amount: 1000, name: 'Mega' }
        ];

        let selectedGifts = new Set();
        let totalAmount = 0;
        let isCardOpen = false;

        function toggleDonationCard() {
            const card = document.getElementById('donationCard');
            
            if (isCardOpen) {
                closeDonationCard();
            } else {
                card.classList.add('show');
                isCardOpen = true;
            }
        }

        function closeDonationCard() {
            const card = document.getElementById('donationCard');
            card.classList.remove('show');
            isCardOpen = false;
        }

        function selectGift(index, element) {
            const gift = gifts[index];
            
            if (selectedGifts.has(index)) {
                selectedGifts.delete(index);
                element.classList.remove('selected');
                totalAmount -= gift.amount;
            } else {
                selectedGifts.add(index);
                element.classList.add('selected');
                totalAmount += gift.amount;
            }
            
            updateTotal();
        }

        function updateTotal() {
            const totalElement = document.getElementById('totalAmount');
            const donateBtn = document.getElementById('donateBtn');
            
            if (totalAmount >= 1000) {
                totalElement.textContent = (totalAmount / 1000) + 'M';
            } else {
                totalElement.textContent = totalAmount + 'K';
            }
            
            if (totalAmount > 0) {
                donateBtn.disabled = false;
                donateBtn.textContent = 'Donate';
            } else {
                donateBtn.disabled = true;
                donateBtn.textContent = 'Chọn quà';
            }
        }

        async function processDonation() {
            accessToken = localStorage.getItem('token')
            if(!accessToken) {
                alert(`Bạn cần đăng nhập để donate`)
                return
            }
            currentUser = await checkMe()
            const selectedItems = Array.from(selectedGifts).map(index => gifts[index].name);

            const payload = {
                gift: JSON.stringify(selectedItems),
                total: totalAmount,
                sender: currentUser.fullName,
            };
                const res = await fetch(`/donate/messages/${chatId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                closeDonationCard();
        }

        // Đóng khi click bên ngoài
        document.addEventListener('click', function(event) {
            const container = document.querySelector('.donate-container');
            if (isCardOpen && !container.contains(event.target)) {
                closeDonationCard();
            }
        });

        // Đóng khi nhấn ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && isCardOpen) {
                closeDonationCard();
            }
        });