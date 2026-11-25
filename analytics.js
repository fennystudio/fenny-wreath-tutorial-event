/* The existing Fenny GA4 property; no credentials or admin changes. */
(function () {
  'use strict';
  var measurement = 'G-FEYLE5FWZZ';
  var query = new URLSearchParams(window.location.search);
  var qa = query.get('fenny_qa') === '1';
  var run = (query.get('qa_run') || 'check').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'check';
  var prefix = qa ? 'wreath_event_qa_' + run + '_' : 'wreath_event_';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurement, {
    send_page_view: !qa,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurement;
  document.head.appendChild(tag);

  function emit(kind, link) {
    var suffix = link ? '_' + link.dataset.trackId : '';
    window.gtag('event', prefix + kind + suffix, {
      send_to: measurement,
      page_location: window.location.href,
      link_id: link ? link.dataset.trackId : '',
      link_url: link ? link.href : '',
      link_text: link ? link.dataset.trackLabel : '',
      button_position: link ? link.dataset.trackPosition : '',
      transport_type: 'beacon'
    });
  }

  emit('view');
  function recordClick(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    var link = event.target.closest('a[data-track-id]');
    if (link) emit('click', link);
    // Links keep their normal target/navigation even if Analytics is blocked.
  }
  document.addEventListener('click', recordClick, true);
  document.addEventListener('auxclick', recordClick, true);

  if ('IntersectionObserver' in window) {
    var seen = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
        var link = entry.target;
        if (seen.has(link.dataset.trackId)) return;
        seen.add(link.dataset.trackId);
        emit('seen', link);
        observer.unobserve(link);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('a[data-track-id]').forEach(function (link) {
      observer.observe(link);
    });
  }
})();
