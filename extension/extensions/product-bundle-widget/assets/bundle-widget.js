class c{constructor(t){this.container=t,this.productId=t.dataset.productId,this.shop=t.dataset.shop,this.layout=t.dataset.layout||"grid",this.showSavings=t.dataset.showSavings==="true",this.showImages=!0,this.init()}async init(){if(!this.productId||!this.shop){this.showError("Missing required data");return}await this.fetchAndRender()}showLoading(){const t=this.container.querySelector(".bundle-loading");t&&t.classList.remove("bundle-widget-hidden")}hideLoading(){const t=this.container.querySelector(".bundle-loading");t&&t.remove()}showError(t){this.hideLoading();const e=this.container.querySelector(".bundle-widget-content");e&&(e.innerHTML=`<div class="bundle-error">${t}</div>`)}async fetchBundle(){try{const t=`/apps/bundles/products?productId=${encodeURIComponent(this.productId)}&shop=${encodeURIComponent(this.shop)}`,e=await fetch(t);if(!e.ok)return console.error(`Bundle fetch failed: ${e.status} ${e.statusText}`),null;const s=await e.json();return!s.success||!s.bundles?.length?null:s.bundles[0]}catch(t){return console.error("Bundle fetch error:",t),null}}async fetchAndRender(){this.showLoading();const t=await this.fetchBundle();if(!t){this.showError("No bundles available for this product");return}this.render(t),this.hideLoading()}render(t){const e=t.settings?.layout||this.layout,s=t.settings?.showSavings??this.showSavings,n=t.settings?.showProductImages??this.showImages,i=this.container.querySelector(".bundle-widget-content");if(!i)return;i.innerHTML=`
            <div class="bundle-widget">
                <div class="bundle-header">
                    <h3 class="bundle-title">${this.escapeHtml(t.name)}</h3>
                    ${s&&t.discountValue?`<span class="bundle-savings">Save ${t.discountValue}${t.discountType==="PERCENTAGE"?"%":"$"}</span>`:""}
                </div>
                <div class="bundle-products bundle-products--${e}">
                    ${t.products.sort((d,r)=>d.displayOrder-r.displayOrder).map(d=>this.renderProduct(d,n)).join("")}
                </div>
                <button class="bundle-add-to-cart" data-bundle-id="${t.id}">
                    Add Bundle to Cart
                </button>
            </div>
        `;const a=i.querySelector(".bundle-add-to-cart");a&&a.addEventListener("click",()=>this.handleAddToCart(t))}renderProduct(t,e){const s=t.role==="OPTIONAL",n=t.compareAtPrice>0&&t.compareAtPrice>t.price;return`
            <div class="bundle-product ${s?"bundle-product--optional":""}" data-product-id="${t.id}">
                ${e&&t.featuredImage?`<div class="bundle-product__image">
                         <img src="${t.featuredImage}" alt="${this.escapeHtml(t.title)}" loading="lazy" />
                       </div>`:""}
                <div class="bundle-product__info">
                    <h4 class="bundle-product__title">${this.escapeHtml(t.title)}</h4>
                    <div class="bundle-product__pricing">
                        <span class="bundle-product__price">$${t.price.toFixed(2)}</span>
                        ${n?`<span class="bundle-product__compare-price">$${t.compareAtPrice.toFixed(2)}</span>`:""}
                    </div>
                    ${s?'<span class="bundle-product__badge">Optional</span>':""}
                </div>
            </div>
        `}handleAddToCart(t){const e=t.products.filter(s=>s.role==="INCLUDED"||s.role==="OPTIONAL").map(s=>({id:s.variantId,quantity:s.quantity,properties:{_bundle_id:t.id,_bundle_name:t.name}}));this.container.dispatchEvent(new CustomEvent("bundle:addToCart",{detail:{bundle:t,cartItems:e,totalItems:e.length},bubbles:!0})),console.log("Adding bundle to cart:",{bundleId:t.id,bundleName:t.name,items:e})}escapeHtml(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}}document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(".bundle-widget-container").forEach(t=>{try{new c(t)}catch(e){console.error("Failed to initialize bundle widget:",e)}})});
