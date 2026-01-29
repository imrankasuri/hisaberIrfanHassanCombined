export const RenderHTMLString = (htmlString) => {
    // Your function logic goes here
    return (
        <div dangerouslySetInnerHTML={{ __html: htmlString }} />
    );
};

export const RenderHTMLStringWithoutDiv = (htmlString) => {
    // Your function logic goes here
    return (
        <div className='row p-0 m-0'  dangerouslySetInnerHTML={{ __html: htmlString }} />
    );
};


export function calculateColumnTotal(data, columnName) {
    let total = 0;

    data.forEach((row) => {
        total += Math.round(row[columnName]);
    });

    return total;
}

export  function getMonthName(monthNumber) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  
    return monthNames[monthNumber - 1];
  }