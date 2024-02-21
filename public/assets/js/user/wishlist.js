
function toWishlist(productId, vIndex)
{
    let isLoggedIn = JSON.parse(document.getElementById('authStatus').getAttribute('data-is-loggedin'));

    // check if the user is authenticated.
    if(! isLoggedIn)
    {
        // sent the user to the login page if the user have no session.
        Swal.fire({
            title : "Please Login",
            text : "You need to login for add item to your wishlist :)",
            icon : 'warning',
            showConfirmButton : true,
            showConfirmButton : 'OK',
        })
        .then(() =>
        {
            window.location.href = '/login';
        })

        return;
    }

    const data = 
    {
        productId : productId,
        index : vIndex
    }

    if(data)
    {
        $.ajax({
            type : "POST",
            url : '/add-wish',
            data : JSON.stringify(data),
            contentType : 'application/json',
            success : (response) =>
            {
                if(response.wishlist)
                {
                    Swal.fire({
                        title : "added to wishlist",
                        text : "The product has been added to the wishlist",
                        icon : 'success',
                        showConfirmButton : true,
                        confirmButtonText : 'OK'
                    })
                    .then(result)
                    {
                        if(result.isConfirmed)
                        {
                            location.reload();
                        }
                    }
                }
                else
                {
                    Swal.fire({
                        title : "error",
                        text : "can't add the product !",
                        icon : 'warning'
                    })
                }
            }
        })
    }
}


const addToWishlist = (productId) =>
{
    const index = document.getElementById('productName').getAttribute('data-index');

    try
    {
        $.ajax(
            {
                type : "POST",
                url : '/checkSession',
                success : (response) =>
                {
                    if(response.session)
                    {
                        toWishlist(productId, index);
                    }
                }
            }
        )
    }
    catch(error)
    {
        console.log(error);
    }
}