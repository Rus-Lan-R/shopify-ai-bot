(function () {
  const iframe = document.createElement("iframe");
  iframe.id = "aiChatIframeId"
  iframe.src = "http://localhost:50010/widget?shop=offline_nikasoul-store.myshopify.com"; 
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.border = "none"
  iframe.style.width = '48px';
  iframe.style.height = '48px';
  iframe.style.overflow = "hidden"

  function resizeIframe() {
    const iframe = document.getElementById('myIframe');
    if (iframe.contentWindow.document.body) {
      console.log(iframe.contentWindow.document.body.scrollHeight)
      iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
    }
  }

  document.getElementById('aiChatIframeId').onload = resizeIframe;

  // document.addEventListener("DOMContentLoaded", function () {
  //   document.body.appendChild(iframe);
  // });

  // function resizeIFrameToFitContent( iFrame ) {
  //   iFrame.width  = iFrame.contentWindow.document.body.scrollWidth;
  //   iFrame.height = iFrame.contentWindow.document.body.scrollHeight;
  //   console.log(iFrame.contentWindow.document.body.scrollWidth, iFrame.contentWindow.document.body.scrollHeight )
  // }

  // window.addEventListener('DOMContentLoaded', function(e) {
  //   var iFrame = document.getElementById( 'aiChatIframeId' );
  //   resizeIFrameToFitContent( iFrame );
  // });

})();