<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ExcelImport implements ToCollection, WithHeadingRow {
    public Collection $rows;

    public function collection(Collection $rows): void {
        $this->rows = $rows;
    }
}
