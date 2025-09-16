var d={};class r{constructor(t){this.container=t,this.productId=t.dataset.productId,this.init()}async init(){await this.fetchAndRender()}showLoading(){const t=this.container.querySelector(".bundle-loading");t&&t.classList.remove("bundle-widget-hidden")}hideLoading(){const t=this.container.querySelector(".bundle-loading");t&&t.remove()}showError(t){this.container.innerHTML=`<div class="bundle-error">${t}</div>`}async fetchBundle(){try{const t=d.NEXT_PUBLIC_SHOPIFY_APP_URL||window.location.origin,i=`/api/storefront/product?productId=${encodeURIComponent(this.productId)}`,n=await fetch(i);if(console.log(n),!n.ok)return null;const o=await n.json();return o?.products?.length?o:null}catch(t){return console.error(t),null}}async fetchAndRender(){this.showLoading();const t=await this.fetchBundle();if(!t){this.showError("No bundles available for this product");return}this.render(t),this.hideLoading()}render(t){const i=this.container.dataset.layout||"grid",n=this.container.dataset.showSavings==="true",o=this.container.dataset.showImages==="true";this.container.querySelector(".bundle-widget-content").innerHTML=`
            <div class="bundle-widget">
                <div class="bundle-header">
                    <h3 class="bundle-title">${t.name}</h3>
                    ${n&&t.discountValue?`<span class="bundle-savings">Save ${t.discountValue}${t.discountType==="PERCENTAGE"?"%":""}</span>`:""}
                </div>
                <div class="bundle-products bundle-products--${i}">
                    ${t.products.map(e=>`
                        <div class="bundle-product ${e.role==="OPTIONAL"?"optional":""}">
                            ${o&&e.image?`<img src="${e.image}" alt="${e.title}" />`:""}
                            <div class="bundle-product-info">
                                <p>${e.title}</p>
                                <p>$${e.price.toFixed(2)}</p>
                            </div>
                        </div>
                    `).join("")}
                </div>
                <button class="bundle-add-to-cart">Add Bundle to Cart</button>
            </div>
        `}}document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(".bundle-widget-container").forEach(t=>new r(t))});
