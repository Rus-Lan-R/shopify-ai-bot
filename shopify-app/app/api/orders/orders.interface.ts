// export interface ICustomAttribute {
//   key: string;
//   value: string;
// }

// export interface IOrderLineItem {
//   id: string;
//   title: string;
//   name: string;
//   quantity: number;
//   variant: {
//     id: string;
//     title: string;
//   };
//   customAttributes: ICustomAttribute[];
//   discountAllocations: {
//     allocatedAmount: IMoney;
//   }[];
//   discountedUnitPriceAfterAllDiscountsSet: {
//     shopMoney: IMoney;
//   };
//   originalUnitPriceSet: {
//     shopMoney: IMoney;
//   };
// }

// export interface IOrder {
//   id: string;
//   createdAt: string;
//   email: string;
//   name: string;
//   customer: {
//     email: string;
//     firstName: string;
//     lastName: string;
//   };
//   displayFulfillmentStatus: string;
//   displayFinancialStatus: string;
//   totalPriceSet: {
//     shopMoney: {
//       amount: string;
//     };
//   };
//   channelInformation: {
//     channelDefinition: {
//       channelName: string;
//       handle: string;
//     };
//   };

//   lineItems: {
//     nodes: IOrderLineItem[];
//   };
//   shippingLines: {
//     nodes: {
//       title: string;
//       discountedPriceSet: {
//         shopMoney: IMoney;
//       };
//       originalPriceSet: {
//         shopMoney: IMoney;
//       };
//     }[];
//   };
//   fulfillments: {
//     status: string;
//     createdAt: string;
//   }[];
// }
// export interface IOrdersQueryResponse {
//   data: { orders: { nodes: IOrder[]; pageInfo: IPageInfo } };
// }
