// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

interface NFTApprovalInterface {
    function setApprovalForAll(address, bool) external;

    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}

interface ERC20ApprovalInterface {
    function approve(address, uint256) external;

    function allowance(address _owner, address _operator) external view returns (uint256);
}

/**
 * @notice Custody plumbing: lets Pinkwhale receive collateral and hand it back
 *         out through Seaport.
 * @dev    `ERC1155Holder` is not decoration. Seaport moves ERC1155 with
 *         `safeTransferFrom`, so without `onERC1155Received` an ERC1155 loan
 *         reverts on the way in.
 */
abstract contract TokenUtils is ERC1155Holder {
    function _approveToken(bool isNft, address tokenAddress, address operator) internal {
        if (isNft) {
            NFTApprovalInterface token = NFTApprovalInterface(tokenAddress);

            if (!token.isApprovedForAll(address(this), operator)) {
                token.setApprovalForAll(operator, true);
            }
        } else {
            ERC20ApprovalInterface token = ERC20ApprovalInterface(tokenAddress);

            if (token.allowance(address(this), operator) == 0) {
                token.approve(operator, type(uint256).max);
            }
        }
    }

    function onERC721Received(address, address, uint256, bytes calldata) public pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
