(function ($) {
    "use strict";

    const delivered = document.getElementById('deli').getAttribute('data-delivered');
    const placed = document.getElementById('plac').getAttribute('data-placed');
    const cancelled = document.getElementById('cance').getAttribute('data-cancelled');
    const returned = document.getElementById('retu').getAttribute('data-returns');

    const orderStatuses = 
    {
        delivered : delivered,
        placed : placed,
        canceled : cancelled,
        return : returned
    }

    /* Sale statistics Pie Chart */
    if ($('#myChart').length) {
        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            type: 'pie', // Change the chart type to 'pie'
            
            data: {
                labels: Object.keys(orderStatuses), // Labels for each slice
                datasets: [{
                    data: Object.values(orderStatuses), // Example data (replace with your actual data)
                    backgroundColor: [
                        'rgba(44, 120, 220, 0.2)',
                        'rgba(4, 209, 130, 0.2)',
                        'rgba(380, 200, 230, 0.2)',
                        'rgba(116, 40, 148, 0.2)'
                    ],
                    borderColor: [
                        'rgba(44, 120, 220)',
                        'rgb(4, 209, 130)',
                        'rgb(380, 200, 230)',
                        'rgba(116, 40, 148)'
                    ],
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    }
                },
                
            }
        });
    } // End if

    /*Sale statistics Chart*/
    if ($('#myChart2').length) {
        var ctx = document.getElementById("myChart2");
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: ["900", "1200", "1400", "1600"],
            datasets: [
                {
                    label: "US",
                    backgroundColor: "#5897fb",
                    barThickness:10,
                    data: [233,321,783,900]
                }, 
                {
                    label: "Europe",
                    backgroundColor: "#7bcf86",
                    barThickness:10,
                    data: [408,547,675,734]
                },
                {
                    label: "Asian",
                    backgroundColor: "#ff9076",
                    barThickness:10,
                    data: [208,447,575,634]
                },
                {
                    label: "Africa",
                    backgroundColor: "#d595e5",
                    barThickness:10,
                    data: [123,345,122,302]
                },
            ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                        usePointStyle: true,
                        },
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } //end if
    
})(jQuery);



// (function ($) {
//     "use strict";

//     /*Sale statistics Chart*/
//     if ($('#myChart').length) {
//         var ctx = document.getElementById('myChart').getContext('2d');
//         var chart = new Chart(ctx, {
//             // The type of chart we want to create
//             type: 'line',
            
//             // The data for our dataset
//             data: {
//                 labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//                 datasets: [{
//                         label: 'Sales',
//                         tension: 0.3,
//                         fill: true,
//                         backgroundColor: 'rgba(44, 120, 220, 0.2)',
//                         borderColor: 'rgba(44, 120, 220)',
//                         data: [18, 17, 4, 3, 2, 20, 25, 31, 25, 22, 20, 9]
//                     },
//                     {
//                         label: 'Visitors',
//                         tension: 0.3,
//                         fill: true,
//                         backgroundColor: 'rgba(4, 209, 130, 0.2)',
//                         borderColor: 'rgb(4, 209, 130)',
//                         data: [40, 20, 17, 9, 23, 35, 39, 30, 34, 25, 27, 17]
//                     },
//                     {
//                         label: 'Products',
//                         tension: 0.3,
//                         fill: true,
//                         backgroundColor: 'rgba(380, 200, 230, 0.2)',
//                         borderColor: 'rgb(380, 200, 230)',
//                         data: [30, 10, 27, 19, 33, 15, 19, 20, 24, 15, 37, 6]
//                     }

//                 ]
//             },
//             options: {
//                 plugins: {
//                 legend: {
//                     labels: {
//                     usePointStyle: true,
//                     },
//                 }
//                 }
//             }
//         });
//     } //End if

//     /*Sale statistics Chart*/
    // if ($('#myChart2').length) {
    //     var ctx = document.getElementById("myChart2");
    //     var myChart = new Chart(ctx, {
    //         type: 'bar',
    //         data: {
    //         labels: ["900", "1200", "1400", "1600"],
    //         datasets: [
    //             {
    //                 label: "US",
    //                 backgroundColor: "#5897fb",
    //                 barThickness:10,
    //                 data: [233,321,783,900]
    //             }, 
    //             {
    //                 label: "Europe",
    //                 backgroundColor: "#7bcf86",
    //                 barThickness:10,
    //                 data: [408,547,675,734]
    //             },
    //             {
    //                 label: "Asian",
    //                 backgroundColor: "#ff9076",
    //                 barThickness:10,
    //                 data: [208,447,575,634]
    //             },
    //             {
    //                 label: "Africa",
    //                 backgroundColor: "#d595e5",
    //                 barThickness:10,
    //                 data: [123,345,122,302]
    //             },
    //         ]
    //         },
    //         options: {
    //             plugins: {
    //                 legend: {
    //                     labels: {
    //                     usePointStyle: true,
    //                     },
    //                 }
    //             },
    //             scales: {
    //                 y: {
    //                     beginAtZero: true
    //                 }
    //             }
    //         }
    //     });
    // } //end if
    
// })(jQuery);
