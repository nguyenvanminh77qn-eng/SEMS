/**
 * SEMS REUSABLE MODAL COMPONENT
 */

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Global event listeners for modal backdrop and data-close attributes
document.addEventListener('DOMContentLoaded', () => {
  // Close buttons with data-close attribute
  document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', (e) => {
      const modal = button.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Click outside modal content to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // ESC key to close any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.modal-overlay.open');
      if (openModal) {
        openModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });
});

