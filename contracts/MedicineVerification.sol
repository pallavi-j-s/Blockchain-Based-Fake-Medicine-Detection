
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MedicineVerification {

    struct Medicine {
        string name;
        string manufacturer;
        string batchNumber;
        string expiryDate;
        bool exists;
    }

    mapping(string => Medicine) public medicines;

    event MedicineRegistered(
        string medicineId,
        string name,
        string manufacturer
    );

    function registerMedicine(
        string memory _medicineId,
        string memory _name,
        string memory _manufacturer,
        string memory _batchNumber,
        string memory _expiryDate
    ) public {

        require(bytes(_medicineId).length > 0, "Medicine ID required");
        require(!medicines[_medicineId].exists, "Medicine already registered");

        medicines[_medicineId] = Medicine(
            _name,
            _manufacturer,
            _batchNumber,
            _expiryDate,
            true
        );

        emit MedicineRegistered(
            _medicineId,
            _name,
            _manufacturer
        );
    }

    function verifyMedicine(
        string memory _medicineId
    ) public view returns (bool) {
        return medicines[_medicineId].exists;
    }
}
