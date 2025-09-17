class i{constructor(t){this.container=t,this.productId=t.dataset.productId,this.init()}async init(){await this.fetchAndRender()}showLoading(){const t=this.container.querySelector(".bundle-loading");t&&t.classList.remove("bundle-widget-hidden")}hideLoading(){const t=this.container.querySelector(".bundle-loading");t&&t.remove()}showError(t){this.container.innerHTML=`<div class="bundle-error">${t}</div>`}async fetchBundle(){try{const t=`/apps/bundles/products?productId=${encodeURIComponent(this.productId)}`,n=await fetch(t);if(console.log(n),!n.ok)return null;const o=await n.json();return o?.products?.length?o:null}catch(t){return console.error(t),null}}async fetchAndRender(){this.showLoading();const t=await this.fetchBundle();if(!t){this.showError("No bundles available for this product");return}this.render(t),this.hideLoading()}render(t){const n=this.container.dataset.layout||"grid",o=this.container.dataset.showSavings==="true",d=this.container.dataset.showImages==="true";this.container.querySelector(".bundle-widget-content").innerHTML=`
            <div class="bundle-widget">
                <div class="bundle-header">
                    <h3 class="bundle-title">${t.name}</h3>
                    ${o&&t.discountValue?`<span class="bundle-savings">Save ${t.discountValue}${t.discountType==="PERCENTAGE"?"%":""}</span>`:""}
                </div>
                <div class="bundle-products bundle-products--${n}">
                    ${t.products.map(e=>`
                        <div class="bundle-product ${e.role==="OPTIONAL"?"optional":""}">
                            ${d&&e.image?`<img src="${e.image}" alt="${e.title}" />`:""}
                            <div class="bundle-product-info">
                                <p>${e.title}</p>
                                <p>$${e.price.toFixed(2)}</p>
                            </div>
                        </div>
                    `).join("")}
                </div>
                <button class="bundle-add-to-cart">Add Bundle to Cart</button>
            </div>
        `}}document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(".bundle-widget-container").forEach(t=>new i(t))});
