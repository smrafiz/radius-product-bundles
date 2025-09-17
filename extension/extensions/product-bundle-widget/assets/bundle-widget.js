class a{constructor(t){this.container=t,this.productId=t.dataset.productId,console.log(this.productId),this.init()}async init(){await this.fetchAndRender()}showLoading(){const t=this.container.querySelector(".bundle-loading");t&&t.classList.remove("bundle-widget-hidden")}hideLoading(){const t=this.container.querySelector(".bundle-loading");t&&t.remove()}showError(t){this.container.innerHTML=`<div class="bundle-error">${t}</div>`}async fetchBundle(){try{const t=`/apps/bundles/products?productId=${encodeURIComponent(this.productId)}`,d=await fetch(t);if(!d.ok)return null;const s=await d.json();if(console.log("API response:",s),!s?.bundles?.length)return null;const e=s.bundles[0];return console.log(e),{name:e.name,discountType:e.discountType,discountValue:e.discountValue,settings:e.settings,products:e.products.map(o=>({productId:o.id,variantId:o.variantId,quantity:o.quantity,title:o.title,price:Number(o.price)||0,role:o.role,image:o.featuredImage}))}}catch(t){return console.error(t),null}}async fetchAndRender(){this.showLoading();const t=await this.fetchBundle();if(!t){this.showError("No bundles available for this product");return}this.render(t),this.hideLoading()}render(t){const d=this.container.dataset.layout||"grid",s=this.container.dataset.showSavings==="true",e=this.container.dataset.showImages==="true";this.container.querySelector(".bundle-widget-content").innerHTML=`
            <div class="bundle-widget">
                <div class="bundle-header">
                    <h3 class="bundle-title">${t.name}</h3>
                    ${s&&t.discountValue?`<span class="bundle-savings">Save ${t.discountValue}${t.discountType==="PERCENTAGE"?"%":""}</span>`:""}
                </div>
                <div class="bundle-products bundle-products--${d}">
                    ${t.products.map(n=>`
                        <div class="bundle-product ${n.role==="OPTIONAL"?"optional":""}">
                            ${e&&n.image?`<img src="${n.image}" alt="${n.title}" />`:""}
                            <div class="bundle-product-info">
                                <p>${n.title}</p>
                                <p>$${n.price.toFixed(2)}</p>
                            </div>
                        </div>
                    `).join("")}
                </div>
                <button class="bundle-add-to-cart">Add Bundle to Cart</button>
            </div>
        `}}document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(".bundle-widget-container").forEach(t=>new a(t))});
